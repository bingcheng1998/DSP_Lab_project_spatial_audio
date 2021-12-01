filename='./dist/index.html'
gsed -i 's/container full_height ui/full_height ui container/' $filename
gsed -i 's/icons large/large icons/' $filename
gsed -i 's/angle double down icon inverted large/inverted large angle double down icon/' $filename
gsed -i 's/button controls-play icon labeled toggle ui/controls-play ui toggle labeled icon button/' $filename
gsed -i 's/icon play/play icon/' $filename
gsed -i 's/column container doubling four grid ui/ui four column doubling grid container/' $filename
gsed -i 's/segment ui/ui segment/' $filename
#gsed -i 's/container/DOCTYPE2/' $filename
#gsed -i 's/container/DOCTYPE2/' $filename
cp './semantic/themes/default/assets/fonts/icons.woff2' './dist/icons.56088456.woff2'
cp './semantic/themes/default/assets/fonts/icons.woff' './dist/icons.56088456.woff'
cp './semantic/themes/default/assets/fonts/icons.ttf' './dist/icons.56088456.ttf'
