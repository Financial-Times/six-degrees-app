git add .
git commit -m "Config update"

git checkout master
git pull origin master

git checkout develop
git rebase master

gulp client-build-release