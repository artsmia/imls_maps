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
