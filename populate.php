<html>
<head>
   <title>F.A.C.E</title>
</head>

<body>
<?php
	$expressions = ['sadness', 'neutral', 'disgust', 'anger', 'surprise', 'fear', 'happiness'];

	$TOTAL = 70;
	$DIVIDER = 35;

	for ($i = 0; $i < $TOTAL; $i++) {
		$id = $i+1;
		if($i<$DIVIDER){
			$gender = 'female';
			$age_group = ceil(($i+1)/7);
		}else{
			$age_group = ceil(($i+1-35)/7);
			$gender = 'male';
		}

		$expression = $expressions[$i%7];

		print "INSERT INTO faces (id, gender, age_group, expression) Values($id,'$gender', $age_group, '$expression');";		
	}	
?>

</body>
</html>
