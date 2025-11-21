echo "cd to project root directory"
cd ..
echo "----- CHECKING OUT the most recent branch  -------"
#git checkout $1
git reset --hard HEAD
git pull || exit 1
#setting branch for website-env
sed -i "s/<<CC_URL_PREFIX>>/"$BRANCH"/g" .envs/.test/.web
sed -i "s/<<CC_URL_PREFIX>>/"$BRANCH"/g" .envs/.test/.proxy
#build and stop current containers
echo "----- BUILDING environment -------"
WEB_PORT=$WEB_OUT_PORT SWAGGER_PORT=$SWAGGER_OUT_PORT ./ccman build --no-cache web app backup cache queue search || exit 1
#run migrations
echo "----- STOPPING OLD INSTANCE ------"
WEB_PORT=$WEB_OUT_PORT SWAGGER_PORT=$SWAGGER_OUT_PORT ./ccman stop
echo "----- RUNNING MIGRATIONS   -------"
WEB_PORT=$WEB_OUT_PORT SWAGGER_PORT=$SWAGGER_OUT_PORT ./ccman up -d
echo "sleeping for 100s to make sure the web is running" && sleep 100
WEB_PORT=$WEB_OUT_PORT SWAGGER_PORT=$SWAGGER_OUT_PORT ./ccman exec web "yarn db:migrate"
sleep 10
#restart after migration done :)
echo "----- RESTARTING THE application ------"
WEB_PORT=$WEB_OUT_PORT SWAGGER_PORT=$SWAGGER_OUT_PORT ./ccman stop
WEB_PORT=$WEB_OUT_PORT SWAGGER_PORT=$SWAGGER_OUT_PORT ./ccman up -d
