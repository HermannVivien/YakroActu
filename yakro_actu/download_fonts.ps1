$fonts = @(
    "https://github.com/google/fonts/raw/main/apache/googlesans/static/GoogleSans-Regular.ttf",
    "https://github.com/google/fonts/raw/main/apache/googlesans/static/GoogleSans-Bold.ttf",
    "https://github.com/google/fonts/raw/main/apache/googlesans/static/GoogleSans-Medium.ttf",
    "https://github.com/google/fonts/raw/main/apache/googlesans/static/GoogleSans-Light.ttf"
)

$fonts | ForEach-Object {
    $url = $_
    $filename = $url.Split('/')[-1]
    $path = Join-Path "assets\fonts" $filename
    
    Write-Host "Downloading $filename..."
    Invoke-WebRequest -Uri $url -OutFile $path
}
