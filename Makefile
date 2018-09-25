SHELL := bash

update:
	dir="backup/$$(date +%Y-%m-%d-%H%M)"; \
	mkdir $$dir; \
	mv map-locations.{csv,json} objects.json threads.json $$dir
	make artworks objects.json threads.json

# Pull objects from a custom google doc built by the Maps team
#
# TODO this doesn't actually work. The doc includes a custom formula that converts
# the accession number entered by the maps team into an object ID that's needed here.
# This formula is not included in the publishable `.csv` output by google docs.
#
# The sheet needs to be manually downloaded as CSV and renamed to map-locations.csv
# (File > Download as > .csv, current sheet)
url = https://docs.google.com/spreadsheets/d/16_696FhwbifLh7jGycKBEwQkdIGgzZZ2VzqilXzriv0/export?format=csv
map-locations.csv:
	curl --silent -o map-locations.csv $(url)

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
  | csvgrep -c2,3,4,5,6,7,8,9 --regex '^$$' -i \
	| csvgrep -c18,19,20 --regex '^$$' -i \
	| csvgrep -c12 --regex '^$$' -i \
	| csvcut -c2,3,4,5,6,7,8,9,12,15,18,19,20-24 \
	| csvjson \
	| tee map-locations.json \
	| jq -c -r 'map({ \
		id: .["Primary Object ID"], \
		coords: (.["Map Coordinates"] | split(", ") | reverse), \
		threads: (. | to_entries | del(.[8,9,10,11,12,13,14,15]) | map(select(.value != null)) | map(.key)), \
		relateds: ([.["Secondary Object ID"], .["Third Object ID"]] | del(.[] | nulls) | del(.[] | select(. == "#ERROR!"))), \
		relatedCaption: .["Captions"], \
		relatedCaption2: .["Captions #2"], \
		content: (. | to_entries | del(.[8,9,10,11,12,13,14,15]) | map(select(.value != null and .value != true and .value != "1" and .value != 1)) | from_entries ), \
		displayDate: .["Listed Date"], \
		sortDate: .["Date for Sorting"] \
	})[]' \
	| tee map-locations.json \
	| while read -r json; do \
		file=objects/$$(jq -r '.id' <<<$$json).md; \
		echo $$file; \
		if [[ -f $$file ]]; then \
			existingContent=$$(pandoc --wrap=none --to markdown $$file); \
		else \
			existingContent=''; \
		fi; \
		newContent=$$(jq -r -c ' \
		  .content \
			| to_entries \
			| map("## \(.key)\n\n ### \(.value)") \
			| join("\n\n---\n\n") \
		' <<<$$json); \
		mergedMeta=$$(jq -s 'add' \
			<(jq 'del(.content)' <<<$$json) \
			<(m2j $$file | jq '.[0] | to_entries[0].value | del(.basename, .preview, .coords, .id, .threads, .__content, .relateds)') \
		| json2yaml); \
		echo -e "$$mergedMeta\n---\n\n$$newContent" > $$file; \
  done;
	remark objects/*.md -o

objects.json:
	m2j objects/*.md | jq -c '.[]' > objects.json

threads.json:
	m2j *.md | jq -c '.[]' > threads.json

build:
	browserify app.js -o bundle.js --debug
	sassc -lm sass/main.scss sass/main.css

watch:
	rewatch sass/* -c 'sassc -lm sass/main.scss sass/main.css' &
	watchify app.js -o bundle.js --debug

server = $$deployServer
location = $$deployLocation
deploy:
	scp index.html bundle.js objects.json scene.yaml scene_terrain.yaml $(server):$(location)
	scp sass/main.css $(server):$(location)/sass

install:
	which csvgrep || pip install csvkit
	which json2yaml || gem install json2yaml
	which m2j || npm install -g markdown-to-json-with-content
	which pandoc || brew install pandoc
	which jq || brew install jq
	which watchify || npm i -g watchify
