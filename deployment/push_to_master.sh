git add .
git commit -m "Version update"

git checkout master
git pull origin master
git merge develop

git push origin master