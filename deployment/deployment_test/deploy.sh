echo "cd to project root directory"
cd ../../
echo "----- CHECKING OUT the most recent branch  -------"
#git checkout $1
git reset --hard HEAD
git pull || exit 1
#setting branch for hotfix-website
cd ./scripts
./genEnvFiles || exit 1
cd ..

echo "----- GENERATING MOST RECENT CHANGELOG  -------"
yarn changelog:generate

echo "----- Updating Libraries -------"
SWAGGER_PORT=5001 ./ccman exec web "yarn install"
#build and stop current containers
echo "----- BUILDING environment -------"
SWAGGER_PORT=5001 ./ccman build --no-cache web app backup cache queue search proxy || exit 1
#run migrations
echo "----- STOPPING OLD INSTANCE ------"
SWAGGER_PORT=5001 ./ccman stop
echo "----- RUNNING MIGRATIONS   -------"
SWAGGER_PORT=5001 ./ccman up -d
echo "sleeping for 100s to make sure the web is running" && sleep 100
SWAGGER_PORT=5001 ./ccman db sync
SWAGGER_PORT=5001 ./ccman exec web "yarn db:migrate"
sleep 10
#restart after migration done :)
echo "----- STARTING THE application ------"
SWAGGER_PORT=5001 ./ccman stop
SWAGGER_PORT=5001 ./ccman up -d
echo "----- RESTARTING THE application ------"
sleep 30
SWAGGER_PORT=5001 ./ccman restart
