# NIS-Score
NIS-Score is combination of connector score and skill score
### Tech
* ApacheSpark
* MongoDB
* R
* Python
* GraphFrames
* Scala
* S3
### Run
```sh
$ cd cloned repo path/NIS-Score-Scala
$ sbt package
$ spark-submit --class "NISPageRank" --packages com.amazonaws:aws-java-sdk-pom:1.10.34,org.apache.hadoop:hadoop-aws:2.7.2 nis-score-scala_2.11-0.1.jar {input_file} {output_file} {reset_probability} {tol}
```
### Versions
| # | Version |
| ------ | ------ |
| Scala | 2.11 |
| ApacheSpark | 2.1.1 |
| Python | 3.4 |
