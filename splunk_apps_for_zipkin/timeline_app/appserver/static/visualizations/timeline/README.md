# Timeline Visualization

http://docs.splunk.com/Documentation/CustomViz/1.0.0/Timeline/TimelineIntro

## Sample Searches
```
index=_internal sourcetype=splunkd  
| head 1000  
| eval resource=group  
| transaction maxpause=30s resource  
| eval user = random()%12 
| eval "KeyValue1" = random()%1000 
| eval duration = duration + random()%30000 
| eval duration = if(duration>10000, duration, 0) 
| table resource user _time duration
```