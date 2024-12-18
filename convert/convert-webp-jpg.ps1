Get-ChildItem * -recurse -Filter *.webp |
Foreach-Object {
	$cmd=".\pingo -s4 -quality=90 -jpeg `"$($_.FullName)`""
	Invoke-Expression $cmd
}