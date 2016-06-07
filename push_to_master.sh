git config --global user.email "t.libich@gmail.com"
git config --global user.name "tomaszlibich"

gulp client-build-release
git commit -m "Version update"
git push origin develop:master