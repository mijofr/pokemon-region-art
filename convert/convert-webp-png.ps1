Get-ChildItem * -recurse -Filter *.webp |
Foreach-Object {
	$cmd="magick convert `"$($_.FullName)`" `"$($_.DirectoryName)\$($_.BaseName).png`""
	Invoke-Expression $cmd
}