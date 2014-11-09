<?php
	//Prepare variables
	$age = $_GET['age'];

	if($age >= 0 && $age <= 10){
		$age_group = 1;
	}else if($age >= 11 && $age <= 20){
		$age_group = 2;	
	}else if($age >= 21 && $age <= 40){
		$age_group = 3;
	}else if($age >= 41 && $age <= 70){
		$age_group = 4;
	}else{
		$age_group = 5;
	}

	$gender = strtolower($_GET['gender']);
	$expression = strtolower($_GET['expression']);	

	//Connect to database
	mysql_connect('rijksemoms111.mysql.db',"rijksemoms111","e87ZcpMvNrDg");
	
	//Select database
	mysql_select_db("rijksemoms111") or die(mysql_error());
	
	//Prepeare query
	$sql = "SELECT e_id FROM faces WHERE age_group = $age_group AND gender = '$gender' AND expression = '$expression'"; //
	
	//Execute query
	$result = mysql_query($sql) or die(mysql_error());  
	
	//Show data
	while($row = mysql_fetch_array( $result )) {
		echo $row['e_id'];
	}
?>
