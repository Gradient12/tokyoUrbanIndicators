// Some sql request funtions
// No jQuery in this file

function selectStationsInTown(layer,townName){
    var sub_allStations = layer.getSubLayer(2);
    sql = generateSelectSql('japan_sub_jr_pr', 'jpn_adm_town', 'nl_name_2', townName);
    // console.log(sql);
    sub_allStations.set({'sql':sql});
}

function selectStationsInTokyo(layer){
    var sub_allStations = layer.getSubLayer(2);
    sql = generateSelectSql('japan_sub_jr_pr', 'jpn_adm_prefecture', 'name_1', 'Tokyo');
    // console.log(sql);
    sub_allStations.set({'sql':sql});
}

function generateSelectSql(from1,from2,sharedColumnName,itemName){
    // generate sql in the following format
    // 'SELECT * FROM from1 WHERE ST_contains((SELECT the_geom FROM from2 WHERE "sharedColumnName" ILIKE \'%itemName%\'),public."from1".the_geom)'
    sql = 'SELECT * FROM '+ from1 +' WHERE ST_contains((SELECT the_geom FROM '+ from2 +' WHERE "'+ sharedColumnName +'" ILIKE \'%'+ itemName +'%\'),public."'+from1+'".the_geom)';
    return sql;
}

function generateCountSql(from1,from2,sharedColumnName,itemName){
    // generate sql in the following format
    // 'SELECT COUNT(*) FROM from1 WHERE ST_contains((SELECT the_geom FROM from2 WHERE "sharedColumnName" ILIKE \'%itemName%\'),public."from1".the_geom)'
    sql = 'SELECT COUNT(*) FROM '+ from1 +' WHERE ST_contains((SELECT the_geom FROM '+ from2 +' WHERE "'+ sharedColumnName +'" ILIKE \'%'+ itemName +'%\'),public."'+from1+'".the_geom)';
    return sql;
}
