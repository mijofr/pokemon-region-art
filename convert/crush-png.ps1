Get-ChildItem * -recurse -Filter *.png |
Foreach-Object {
	$cmd="pngcrush -l 9 -ow -reduce `"$($_.DirectoryName)\$($_.BaseName).webp`""
	Invoke-Expression $cmd
}