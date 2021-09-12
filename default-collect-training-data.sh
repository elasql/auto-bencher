SEQUENCER='IP-seq'
SERVERS='IP-server1 IP-server2'

# Create output directory
mkdir -p training-data

# Collect the features from the sequencer
scp $SEQUENCER:~/transaction-features.csv training-data
scp $SEQUENCER:~/transaction-dependencies.txt training-data

# Collect the labels from the servers
for server in $SERVERS
do
        scp $server:~/transaction-latency-server-*.csv training-data
        scp $server:~/transaction-diskio-count-server-*.csv training-data
        scp $server:~/transaction-cpu-time-server-*.csv training-data
        scp $server:~/transaction-networkin-size-server-*.csv training-data
        scp $server:~/transaction-networkout-size-server-*.csv training-data
done