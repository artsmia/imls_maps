map-locations.csv:
	curl -o map-locations.csv 'https://docs.google.com/spreadsheets/d/1eWfVC9ubBSEKIiBE3c4yv4hlE3OQe1A36TxwM4tDNAQ/export?format=csv'

redis:
	@redis-cli del all
	@arguments=$$(csvcut -c13,12 map-locations.csv | grep -v '^,' | grep -v '20.103334' | while read line; do \
		echo $$line \
		| sed 's/"//g; s/,/ /g; s/  / /g' \
		| perl -pe 's/([^ ]+) ([^ ]+) ([^ ]+)/\2 \1 \3/'; \
	done | tail -n+2); \
	redis-cli geoadd all $$arguments

artworks:
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
		if [[ -f $$file ]]; then \
			existingContent=$$(pandoc --to markdown $$file); \
		else \
			existingContent=''; \
		fi; \
		echo "$$(json2yaml <<<$$json)\n---\n$$existingContent" \
		> $$file; \
	done
