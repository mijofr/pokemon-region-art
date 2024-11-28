Get-ChildItem * -recurse -Filter *.png |
Foreach-Object {
	$cmd="cwebp -lossless -z 9 -q 100 -m 6 -mt -noalpha `"$($_.FullName)`" -o `"$($_.DirectoryName)\$($_.BaseName).webp`""
	Invoke-Expression $cmd
}