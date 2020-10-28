cd /root/cypress-vue/
cp -f /TMach_source/cypress/prod.env.js  dist/prod.env.js
docker rmi -f cypress-new && docker rm -f cypress_container-new
docker build -t cypress-new .
docker run -itd -p 82:80 --name cypress_container-new --restart=always cypress-new
