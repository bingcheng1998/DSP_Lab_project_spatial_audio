# This script is used to mv local tf hub model to dist
set -x
cp ./model/facemesh/model.json ./dist/facemesh_model.json
cp ./model/blazeface/model.json ./dist/blazeface_model.json
cp ./model/iris/model.json ./dist/iris_model.json

cp ./model/facemesh/group1-shard1of1.bin ./dist/facemesh_group1-shard1of1.bin
cp ./model/blazeface/group1-shard1of1.bin ./dist/blazeface_group1-shard1of1.bin
cp ./model/iris/group1-shard1of1.bin ./dist/iris_group1-shard1of1.bin

gsed -i 's/group1-shard1of1.bin/facemesh_group1-shard1of1.bin/' ./dist/facemesh_model.json
gsed -i 's/group1-shard1of1.bin/blazeface_group1-shard1of1.bin/' ./dist/blazeface_model.json
gsed -i 's/group1-shard1of1.bin/iris_group1-shard1of1.bin/' ./dist/iris_model.json
