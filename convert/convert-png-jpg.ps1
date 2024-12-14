Get-ChildItem * -recurse -Filter *.png |
Foreach-Object {
	$cmd=".\pingo -s4 -quality=90 -jpeg `"$($_.FullName)`""
	Invoke-Expression $cmd
}