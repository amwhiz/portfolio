# NIS-Score
NIS-Score is combination of connector score and skill score
### Required Software packages
- Apachse Spark 2.2.0
- Python 3.4.x with anaconda
- R 3.2.5
- Scala 2.11
### R packages setup
```sh
$ # Install R Packages
$ sudo yum search curl
$ # Latest EMR pre configured with libcurl, if not install
$ sudo yum install libcurl
$ sudo yum -y install libcurl-devel
$ sudo R --vanilla
$ install.packages("devtools", repos="http://cran.cnr.berkeley.edu")
$ install.packages("plyr", repos="http://cran.cnr.berkeley.edu")
$ install.packages("backports", repos="http://cran.cnr.berkeley.edu")
$ install.packages("ini", repos="http://cran.cnr.berkeley.edu")
$ install.packages("aws.s3", repos="http://cran.cnr.berkeley.edu")
$ install.packages("Rcpp", repos="http://cran.cnr.berkeley.edu")
$ install.packages("xml2", repos="http://cran.cnr.berkeley.edu")
$ library(devtools)
$ install_github(repo = "mongosoup/rmongodb")
```
### SBT setup
```sh
$ # Install sbt
$ curl https://bintray.com/sbt/rpm/rpm | sudo tee /etc/yum.repos.d/bintray-sbt-rpm.repo
$ sudo yum install sbt
```
### Python packages setup
```sh
$ # Create virtual env
$ source activate py34
$ conda install boto3
$ conda install pandas
$ conda install pymongo
```
### Run
```sh
$ ssh {aws_emr}
$ cd NIS-Spark
$ # compile scala class
$ cd NIS-Score-Scala
$ sbt package
$ # env {qa, prod}
$ # Run end to end
$ sh data_pipeline.sh qa
$ sh data_pipeline.sh prod
$ # Run specific file check data_pipeline.sh
```
### Cron Job
```sh
$ # Change cron job duration
$ ssh -i xxxx.pem hadoop@ip_address
$ Ref [CronJob](http://awc.com.my/uploadnew/5ffbd639c5e6eccea359cb1453a02bed_Setting Up Cron Job Using crontab.pdf)
$ crontab -e
$ # QA env Runs every 15 mins
$ */15 * * * * cd /home/hadoop/NIS-Spark && sh data_pipeline.sh qa > /tmp/nis_score_log_qa.log 2>&1
$ # PROD env Runs every 15 mins
$ */15 * * * * cd /home/hadoop/NIS-Spark && sh data_pipeline.sh prod > /tmp/nis_score_log_prod.log 2>&1
```
### Trouble shooting steps
- Logs stored in s3 bucket based on the app environment
- Eg: nis-spark/prod/logs/
- Sort by last modified and check the latest file logs
- Check hdfs disk size "df -h"
- Check Spark log size "hdfs dfs -du /var/log/spark"
### Tech
* ApacheSpark
* MongoDB
* R
* Python
* GraphFrames
* Scala
* S3
* AWS EMR
### Versions
| # | Version |
| ------ | ------ |
| Scala | 2.11 |
| ApacheSpark | 2.2.0 |
| Python | 3.4 |
| MongoDB | 2.6.9 |
| R | 3.2.5 |