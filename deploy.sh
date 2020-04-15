docker build -t 683202/multi-client:latest -t 683202/multi-client:$SHA -f ./client/Dockerfile ./client
docker build -t 683202/multi-api:latest -t 683202/multi-api:$SHA -f ./server/Dockerfile ./server
docker build -t 683202/multi-worker:latest -t 683202/multi-worker:$SHA -f ./worker/Dockerfile ./worker
docker push 683202/multi-client:latest
docker push 683202/multi-api:latest
docker push 683202/multi-worker:latest
docker push 683202/multi-client:$SHA
docker push 683202/multi-api:$SHA
docker push 683202/multi-worker:$SHA
kubectl apply -f k8s
kubectl set image deployments/client-deployment client=683202/multi-client:$SHA
kubectl set image deployments/server-deployment server=683202/multi-api:$SHA
kubectl set image deployments/worker-deployment worker=683202/multi-worker:$SHA