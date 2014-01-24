BIN = ./node_modules/.bin

coverage: clean
	$(BIN)/istanbul cover $(BIN)/_mocha -- -R spec
	@echo
	@echo Open coverage/lcov-report/index.html file in your browser

clean:
	rm -rf coverage

.PHONY: coverage clean
