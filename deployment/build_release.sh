git add .
git commit -m "Config update"

git checkout master
git pull origin master

git checkout develop
git rebase master

gulp client-build-release
git add .

PACKAGE_VERSION=$(node -p -e "require('./package.json').version")
DESCRIPTION="Version update: $PACKAGE_VERSION"
git commit -m "$DESCRIPTION"
git tag -a $PACKAGE_VERSION -m "ver $PACKAGE_VERSION"