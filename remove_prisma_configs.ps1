
$files = Get-ChildItem -Path "d:\Orqent" -Filter "prisma.config.*" -Force
foreach ($file in $files) {
    Remove-Item -Path $file.FullName -Force -ErrorAction Continue
    Write-Host "Removed $($file.FullName)"
}
