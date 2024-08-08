# NIS-Score
NIS-Score is combination of connector score and skill score
### Tech
* ApacheSpark
* MongoDB
* R
* Python
* GraphFrames
### Run
###### S3 Bucket
Replace the AWS Keys in #Config section
```sh
$ cd cloned repo path/Spark
$ spark-submit --packages graphframes:graphframes:0.5.0-spark2.1-s_2.11,com.amazonaws:aws-java-sdk-pom:1.10.34,org.apache.hadoop:hadoop-aws:2.7.2 IntroScore.py
```
### Versions
| # | Version |
| ------ | ------ |
| Scala | 2.11 |
| ApacheSpark | 2.1.1 |
| Python | 3.4 |