docker node ls - Показать что кластер живой
docker service ls - все сервисы с репликами
docker service scale hotelbooking_app=0 - ## убить реплику 

## docker service scale hotelbooking_app=2 - Ждёшь 5 секунд... потом поднимаешь

docker service ls - список активных сервисов 

docker service logs hotelbooking_app --tail 20  - логи живых реплик 

docker info | grep -A 10 "Swarm" - инфо о swarm 

docker stack rm hotelbooking - Удалить стак (все сервисы)

docker swarm leave --force - Выйти из Swarm полностью

______________________________________________________________________
dock
docker swarm init (или docker info с Swarm: active)

тек задеплоен через stack deploy
Команда: docker stack deploy -c docker-compose.swarm.yml hotelbooking
Дальше лист запущенных стаков через: docker stack ls

