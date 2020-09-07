cd /root/cypress-vue/
cp -f /TMach_source/cypress/prod.env.js  dist/prod.env.js
docker rmi -f cypress && docker rm -f cypress_container
docker build -t cypress .
docker run -itd -p 81:80 --name cypress_container --restart=always cypress
