cd api/
rm package-lock.json
git init
heroku git:remote -a helloworldpurdue-api
git add .
git commit -m "hosting"
git push heroku master
rm -rf .git
npm install
cd ../