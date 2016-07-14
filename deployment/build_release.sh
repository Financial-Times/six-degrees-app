#git add .
#git commit -m "Config update"

#git checkout master
#git pull origin master

#git checkout develop
#git rebase master

gulp client-build-release
git add .

PACKAGE_VERSION=$(node -p -e "require('./package.json').version")
DESCRIPTION="Release candidate version update: $PACKAGE_VERSION"
git commit -m "$DESCRIPTION"

git tag -a v$PACKAGE_VERSION -m "ver $PACKAGE_VERSION"
git push origin v$PACKAGE_VERSION

git checkout master
git merge develop
git push origin master

haikro build && haikro deploy --app ft-upp-six-degrees --commit `v$PACKAGE_VERSION`