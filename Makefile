SHELL := bash

map-locations.csv:
	curl --silent -o map-locations.csv 'https://docs.google.com/spreadsheets/d/15uiHw8kkK09mMRPfYizYzE0ZpUK4bx3BYcNVHPr0ZfQ/export?format=csv'

redis:
	@redis-cli del all
	@arguments=$$(csvcut -c13,12 map-locations.csv | grep -v '^,' | grep -v '20.103334' | while read line; do \
		echo $$line \
		| sed 's/"//g; s/,/ /g; s/  / /g' \
		| perl -pe 's/([^ ]+) ([^ ]+) ([^ ]+)/\2 \1 \3/'; \
	done | tail -n+2); \
	redis-cli geoadd all $$arguments

# gem install json2yaml
# brew install pandoc jq
# npm install markdown-to-json
artworks: map-locations.csv
	@csvgrep -c2,3,5 --regex '^$$' -i map-locations.csv  \
	| csvgrep -c12 --regex '^$$' -i \
	| csvcut -c12,13,14 \
	| csvjson \
	| jq -c 'map({ \
		id: .["Object ID"], \
		coords: (.["Map Coordinates"] | split(", ") | reverse), \
		location: (.Location | gsub("\"|[|]"; ""; "g")), \
		related: {label:"", ids: []}, \
		next: {label:"", ids: []} \
	})[]' \
	| while read json; do \
		file=objects/$$(jq -r '.id' <<<$$json).md; \
		echo $$file; \
		if [[ -f $$file ]]; then \
			existingContent=$$(pandoc --no-wrap --to markdown $$file); \
		else \
			existingContent=''; \
		fi; \
		mergedMeta=$$(jq -s 'add' \
			<(echo $$json) \
			<(m2j $$file | jq '.[] | del(.basename, .preview, .location, .coords, .id)') \
		| json2yaml); \
		echo -e "$$mergedMeta\n---\n\n$$existingContent" \
		| cat -s \
		> $$file; \
	done

server = dx
deploy:
	sed "s/__VECTOR_TILES_KEY__/$$mapzenVectorTilesKey/" scene.yaml | sponge scene.yaml
	rsync -avz index.html bundle.js objects.json scene.yaml $(server):/apps/cdn/imls-maps/
