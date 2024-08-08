starttime=Sys.time()
#install.packages('Rcpp')
#install.packages('backports')
#devtools::install_github("hadley/xml2")
#library(xml2)
library(aws.s3)
library(rmongodb)
library(plyr) #join function
library(backports)
library(ini)

args = commandArgs(trailingOnly=TRUE)
config <- read.ini(args[5])
app_env <- args[1]

aws <- read.ini("~/.aws/credentials")
if (length(args) > 0 & "prod" == args[1]) {
	config <- config$prod
	aws_profile <- aws$prod
} else {
	config <- config$qa
	aws_profile <- aws$qa
}


key <- aws_profile$aws_access_key_id
secret <- aws_profile$aws_secret_access_key
fpath <- paste0(app_env,"/",config$fakeusers)
c=get_object(object=fpath, bucket=args[2],key=key,secret=secret)
d=rawToChar(c)
abc=tempfile()
writeLines(d,abc)
fakeuserlist=readLines(abc)

f = function(x) function(i) unlist(lapply(x, `[[`, i), use.names=FALSE)
host <- paste0(config$mdb_address,":",config$mdb_port)
username <- config$mdb_username
password <- config$mdb_pw
db <- config$mdb_db
mongo=mongo.create(host=host,username=username,password=password,db=db)
#mongo.get.database.collections(mongo,db=db)

chatgroups=paste0(db,".chatgroups")
commlogs=paste0(db,".commlogs")
profiles=paste0(db,".profiles")

buf <- mongo.bson.buffer.create()
invisible(mongo.bson.buffer.append.string(buf,"$in", c("intro","request")))
invisible(mongo.bson.buffer.finish.object(buf))
b <- mongo.bson.from.buffer(buf)

buf <- mongo.bson.buffer.create()
invisible(mongo.bson.buffer.append.bson(buf,"purpose", b))
invisible(mongo.bson.buffer.finish.object(buf))
c <- mongo.bson.from.buffer(buf)

buf <- mongo.bson.buffer.create()
invisible(mongo.bson.buffer.append.string(buf,"$nin", fakeuserlist))
invisible(mongo.bson.buffer.finish.object(buf))
b2 <- mongo.bson.from.buffer(buf)

buf <- mongo.bson.buffer.create()
invisible(mongo.bson.buffer.append.bson(buf,"attendeesBackUp.userid", b2))
invisible(mongo.bson.buffer.finish.object(buf))
c2 <- mongo.bson.from.buffer(buf)

buf <- mongo.bson.buffer.create()
invisible(mongo.bson.buffer.start.array(buf, "$and"))
invisible(mongo.bson.buffer.append.bson(buf,"0", c))
invisible(mongo.bson.buffer.append.bson(buf,"1", c2))
invisible(mongo.bson.buffer.finish.object(buf))
d <- mongo.bson.from.buffer(buf)

buf <- mongo.bson.buffer.create()
invisible(mongo.bson.buffer.append.bson(buf,"$match", d))
invisible(mongo.bson.buffer.finish.object(buf))
e <- mongo.bson.from.buffer(buf)

pipe.4=mongo.bson.from.JSON('{"$project":
		{"_id":0
		,"roomId":"$roomId"
		,"recipient":"$attendeesBackUp.userid"
		,"name":"$attendeesBackUp.username"}}')

result <- mongo.aggregation(mongo, ns = chatgroups, pipeline =list(e,pipe.4))

result.r=mongo.bson.to.Robject(result)$result

result.r.creators=result.r
for (i in (names(result.r.creators))) {
	result.r.creators[[i]]=data.frame(result.r[[i]]$roomId,result.r[[i]]$recipient[1],result.r[[i]]$name[1])

}
result.r.creators.df=as.data.frame(Map(f(result.r.creators), names(result.r.creators[[1]])))
names(result.r.creators.df)=c("roomId","userId","Name")

result.r.table=result.r
for (i in (names(result.r))) {
	result.r.table[[i]]=data.frame(rep(result.r[[i]]$roomId,length(result.r[[i]]$recipient)),result.r[[i]]$recipient,result.r[[i]]$name)
	names(result.r.table[[i]])=c("roomId","userId","Name")
	result.r.table[[i]]=result.r.table[[i]][result.r.table[[i]]$userId!="",]
	if(nrow(result.r.table[[i]])==1){
		result.r.table[[i]]=NULL
		}
}


result.r.df=as.data.frame(Map(f(result.r.table), names(result.r.table[[1]])))


roomIds=unique(result.r.df$roomId)
userIds=unique(result.r.df$userId)
buf <- mongo.bson.buffer.create()
invisible(mongo.bson.buffer.append.string(buf,"$in", as.vector(roomIds)))
invisible(mongo.bson.buffer.finish.object(buf))
b <- mongo.bson.from.buffer(buf)

buf <- mongo.bson.buffer.create()
invisible(mongo.bson.buffer.append.bson(buf,"roomId", b))
invisible(mongo.bson.buffer.finish.object(buf))
c <- mongo.bson.from.buffer(buf)

buf <- mongo.bson.buffer.create()
invisible(mongo.bson.buffer.append.string(buf,"$in", as.vector(userIds)))
invisible(mongo.bson.buffer.finish.object(buf))
b2 <- mongo.bson.from.buffer(buf)

buf <- mongo.bson.buffer.create()
invisible(mongo.bson.buffer.append.bson(buf,"userId", b2))
invisible(mongo.bson.buffer.finish.object(buf))
c2 <- mongo.bson.from.buffer(buf)

buf <- mongo.bson.buffer.create()
invisible(mongo.bson.buffer.start.array(buf, "$and"))
invisible(mongo.bson.buffer.append.bson(buf,"0", c))
invisible(mongo.bson.buffer.append.bson(buf,"1", c2))
invisible(mongo.bson.buffer.finish.object(buf))
d <- mongo.bson.from.buffer(buf)

buf <- mongo.bson.buffer.create()
invisible(mongo.bson.buffer.append.bson(buf,"$match", d))
invisible(mongo.bson.buffer.finish.object(buf))
e <- mongo.bson.from.buffer(buf)

pipe.5=mongo.bson.from.JSON(
      '{
        "$group" : {
			"_id": {"userId":"$userId"
			,"roomId":"$roomId"}
		,"count":{ "$sum": 1 }
    	}
      }'
)

result2 <- mongo.aggregation(mongo, ns = commlogs, pipeline =list(e,pipe.5))

rawconnector=mongo.bson.to.Robject(result2)$result

for (w in names(rawconnector)){
	if(nrow(result.r.creators.df[result.r.creators.df$userId==rawconnector[[w]]$"_id"[1] & result.r.creators.df$roomId==rawconnector[[w]]$"_id"[2],])!=0){
		rawconnector[[w]]=NULL
		} else{
			#rawconnector[[w]]$giver.name=result.r.df[rawconnector[[w]]$"_id"[1]==result.r.df$userId & rawconnector[[w]]$"_id"[2]==result.r.df$roomId,"Name"]
			rawconnector[[w]]$giver=result.r.df[rawconnector[[w]]$"_id"[1]==result.r.df$userId & rawconnector[[w]]$"_id"[2]==result.r.df$roomId,"userId"]
			rawconnector[[w]]$receiver=result.r.creators.df[rawconnector[[w]]$"_id"[2]==result.r.creators.df$roomId,"userId"]
			#rawconnector[[w]]$receiver.name=result.r.creators.df[rawconnector[[w]]$"_id"[2]==result.r.creators.df$roomId,"Name"]
		}
}


graphinput2=data.frame(giver=character(),receiver=character())
for (j in (names(rawconnector))) {
	if(length(as.character(rawconnector[[j]]$giver))+length(as.character(rawconnector[[j]]$receiver))==2){
		graphinput2=rbind(graphinput2,data.frame(giver=as.character(rawconnector[[j]]$giver),receiver=as.character(rawconnector[[j]]$receiver)))
	}
}

write.table(graphinput2, file = args[3], append = FALSE, quote = FALSE, sep = " ",
            eol = "\n", na = "NA", dec = ".", row.names = FALSE,
            col.names = FALSE, qmethod = c("escape", "double"),
            fileEncoding = "")


## Start skillscore
graphinput3=data.frame(giver=character(),receiver=character())
for (creatorsgiving in (1:dim(result.r.creators.df)[1])){
	a=join(result.r.df,result.r.creators.df[creatorsgiving,c("roomId","userId")],by="roomId",type="inner")
	names(a)=c("roomId","userId","Name","userId2")
	a$userId=as.character(a$userId)
	a$userId2=as.character(a$userId2)
	b=a[a[,2]!=a[,4],c("roomId","userId","Name")]
	if(length(b$userId)>0){
		for(receivers in (1:length(b$userId))) {
			graphinput3=rbind(graphinput3,data.frame(giver=as.character(result.r.creators.df[creatorsgiving,"userId"]),receiver=b$userId[receivers]))
		}
	}
}

write.table(graphinput3, file = args[4], append = FALSE, quote = FALSE, sep = " ",
            eol = "\n", na = "NA", dec = ".", row.names = FALSE,
            col.names = FALSE, qmethod = c("escape", "double"),
            fileEncoding = "")

print(paste0(Sys.time()-starttime," ",attr(Sys.time()-starttime,"units")," runtime")) #reports how long the script took to run