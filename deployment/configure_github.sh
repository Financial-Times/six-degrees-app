git config --global user.email $GITHUB_USER_EMAIL
git config --global user.name $GITHUB_USER_NAME

echo "machine api.heroku.com login tomasz.libich@ft.com password ${HEROKU_AUTH_TOKEN}" >> /home/ubuntu/.netrc
chmod 0600 /home/ubuntu/.netrc

chmod +x ./deployment/deploy_to_heroku.sh