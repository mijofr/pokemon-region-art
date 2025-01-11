Get-ChildItem * -recurse -Filter *.jpg |
Foreach-Object {
	$cmd="magick convert `"$($_.FullName)`" `"$($_.DirectoryName)\$($_.BaseName).png`""
	Invoke-Expression $cmd
}