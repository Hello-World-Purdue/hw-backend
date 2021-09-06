cd api/
rm package-lock.json
git init
heroku git:remote -a helloworldpurdue-api
git add .
git add -f helloworld2021key.json
git status
git commit -m "hosting"
git push heroku master -f
rm -rf .git
npm install
cd ../