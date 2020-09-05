import os

cmd = "git clone https://zt:angelreef@gitlab.anhereef.com/cypress/cypress-vue.git && " \
      "cd cypress-vue && " \
      "npm install && " \
      "cp -rf src/assets/js/go.js node_modules/gojs/release &&" \
      "cp -rf /TMach_source/cypress/prod.env.js public &&" \
      "npm run build &&" \
      "docker rmi -f cypress &&" \
      "docker rm -f cypress_container &&" \
      "docker build -t cypress . &&" \
      "docker run -itd -p 81:80 --name cypress_container cypress"

if "cypress-vue" in os.listdir("."):
    cmd = "rm -rf cypress-vue/ && echo delete old cypress-vue && " + cmd
os.system(cmd)
