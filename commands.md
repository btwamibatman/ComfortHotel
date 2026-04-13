docker node ls - РџРѕРєР°Р·Р°С‚СЊ С‡С‚Рѕ РєР»Р°СЃС‚РµСЂ Р¶РёРІРѕР№
docker service ls - РІСЃРµ СЃРµСЂРІРёСЃС‹ СЃ СЂРµРїР»РёРєР°РјРё
docker service scale hotelbooking_app=0 - ## СѓР±РёС‚СЊ СЂРµРїР»РёРєСѓ 

## docker service scale hotelbooking_app=2 - Р–РґС‘С€СЊ 5 СЃРµРєСѓРЅРґ... РїРѕС‚РѕРј РїРѕРґРЅРёРјР°РµС€СЊ

docker service ls - СЃРїРёСЃРѕРє Р°РєС‚РёРІРЅС‹С… СЃРµСЂРІРёСЃРѕРІ 

docker service logs hotelbooking_app --tail 20  - Р»РѕРіРё Р¶РёРІС‹С… СЂРµРїР»РёРє 

docker info | grep -A 10 "Swarm" - РёРЅС„Рѕ Рѕ swarm 

docker stack rm hotelbooking - РЈРґР°Р»РёС‚СЊ СЃС‚Р°Рє (РІСЃРµ СЃРµСЂРІРёСЃС‹)

docker swarm leave --force - Р’С‹Р№С‚Рё РёР· Swarm РїРѕР»РЅРѕСЃС‚СЊСЋ

______________________________________________________________________
dock
docker swarm init (РёР»Рё docker info СЃ Swarm: active)

С‚РµРє Р·Р°РґРµРїР»РѕРµРЅ С‡РµСЂРµР· stack deploy
РљРѕРјР°РЅРґР°: docker stack deploy -c docker-compose.swarm.yml hotelbooking
Р”Р°Р»СЊС€Рµ Р»РёСЃС‚ Р·Р°РїСѓС‰РµРЅРЅС‹С… СЃС‚Р°РєРѕРІ С‡РµСЂРµР·: docker stack ls

