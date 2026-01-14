.PHONY: copy-scraped-data load-products decompose init-translations help

SCRAPING_DATA_DIR := /Users/gorky/Sites/scraping/sarsilmaz/data
SCRAPED_DIR := ./scraped

help:
	@echo "Available targets:"
	@echo "  make copy-scraped-data      Copy raw JSONL files from scraping directory"
	@echo "  make load-products          Transform and load products from scraped JSONL"

copy-scraped-data:
	@echo "Copying scraped data from $(SCRAPING_DATA_DIR)..."
	@mkdir -p $(SCRAPED_DIR)
	@cp $(SCRAPING_DATA_DIR)/final_products.jsonl $(SCRAPED_DIR)/products.jsonl
	@cp $(SCRAPING_DATA_DIR)/final_categories.jsonl $(SCRAPED_DIR)/categories.jsonl
	@echo "✓ Files copied successfully"

load-contents:
	@echo "Loading contents..."
	@npm run load:contents

