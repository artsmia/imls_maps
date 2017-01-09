SHELL := bash

# Pull objects from a custom google doc built by the Maps team
map-locations.csv:
	curl --silent -o map-locations.csv 'https://docs.google.com/spreadsheets/d/16_696FhwbifLh7jGycKBEwQkdIGgzZZ2VzqilXzriv0/export?format=csv'

# Add locations to redis - not currently used
redis:
	@redis-cli del all
	@arguments=$$(csvcut -c13,12 map-locations.csv | grep -v '^,' | grep -v '20.103334' | while read line; do \
		echo $$line \
		| sed 's/"//g; s/,/ /g; s/  / /g' \
		| perl -pe 's/([^ ]+) ([^ ]+) ([^ ]+)/\2 \1 \3/'; \
	done | tail -n+2); \
	redis-cli geoadd all $$arguments

# Convert the spreadsheet of artworks, info and coordinates
# to a set of markdown files in `objects/`, named by object id
#
# Requires:
# gem install json2yaml
# brew install pandoc jq
# npm install markdown-to-json
artworks: map-locations.csv
	@tail -n+2 map-locations.csv \
  | csvgrep -c2,3,4,5,6,7,8 --regex '^$$' -i \
	| csvgrep -c17,18,19 --regex '^$$' -i \
	| csvgrep -c11 --regex '^$$' -i \
	| csvcut -c2,3,4,5,6,7,8,11,17,18,19 \
	| csvjson \
	| jq -c 'map({ \
		id: .["Primary Object ID"], \
		coords: (.["Map Coordinates"] | split(", ") | reverse), \
		threads: (. | to_entries | map(select(.value == true)) | map(.key)) \
	})[]' \
	| while read json; do \
		file=objects/$$(jq -r '.id' <<<$$json).md; \
		echo $$file; \
		if [[ -f $$file ]]; then \
			existingContent=$$(pandoc --wrap=none --to markdown $$file); \
		else \
			existingContent=''; \
		fi; \
		mergedMeta=$$(jq -s 'add' \
			<(echo $$json) \
			<(m2j $$file | jq '.[] | del(.basename, .preview, .coords, .id, .threads)') \
		| json2yaml); \
		echo -e "$$mergedMeta\n---\n\n$$existingContent" \
		| cat -s \
		> $$file; \
  done

objects.json:
	m2j objects/*.md | jq -c '.' > objects.json

build:
	browserify app.js -o bundle.js --debug
	sassc -lm sass/main.scss sass/main.css

watch:
	watchify app.js -o bundle.js --debug &
	rewatch sass/* -c 'sassc -lm sass/main.scss sass/main.css' &

server = $$deployServer
location = $$deployLocation
deploy:
	sed "s/__VECTOR_TILES_KEY__/$$mapzenVectorTilesKey/" scene.yaml | sponge scene.yaml
	scp index.html bundle.js objects.json scene.yaml scene_terrain.yaml $(server):$(location)
	scp sass/main.css $(server):$(location)/sass/

install:
	which csvgrep || pip install csvkit
	which json2yaml || gem install json2yaml
	which m2j || npm install -g markdown-to-json
	which pandoc || brew install pandoc
	which jq || brew install jq
	which watchify || npm i -g watchify
