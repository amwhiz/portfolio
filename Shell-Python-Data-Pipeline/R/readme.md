This file is run automatically as part of [data_pipeline.sh](https://github.com/introcom/NIS-Spark/blob/master/data\_pipeline.sh#L34).

## Manual Run
* Syntax: Rscript [nis-spark-input.r path] ["qa" or "prod"] [s3 bucket name] [connector.txt output name/path] [connector.txt output name/path]
 * Example 1: `Rscript ./folder/nis-spark-input.r qa nis-spark connector_date2017.txt skill_date2017.txt`
 * Example 2: `Rscript ./R/nis-spark-input.r prod nis-spark ~/prod/connector.txt ~/prod/skill.txt`

## Output
* Console prints how long Rscript took to run
* Two files will be output (locally)
 * [qa/prod]\connector\_${mydate}.txt
 * [qa/prod]\skill\_${mydate}.txt
 * data_pipeline.sh copies it to s3 environment folder in s3 afterwards

## Requirements
* [See library requirements](https://github.com/introcom/NIS-Spark/blob/master/README.md)
* "credentials" file in directory ./.aws/ (~/.aws/)
