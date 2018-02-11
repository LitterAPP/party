
var data={}
function setData(json){
  for (var item in json) {  
    var value = json[item];
    if (value==null){
      delete json[item];
    }else{
      data[item] = value;
    }
  } 
}
function getAllData(){
  return data;
}
function getData(item){
  return data[item];
}
module.exports = {
  setData: setData,
  getData: getData,
  getAllData: getAllData
}