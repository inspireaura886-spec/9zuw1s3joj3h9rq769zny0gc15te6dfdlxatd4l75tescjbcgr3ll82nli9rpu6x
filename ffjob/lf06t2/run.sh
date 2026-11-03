set -e; mkdir -p out
ffmpeg -v error -y -i a.m4a -i s1.mp4 -i s2.mp4 -i s3.mp4 -filter_complex_script fc.txt -map '[v]' -map '[a]' -r 30 -c:v libx264 -crf 20 -preset medium -c:a aac -b:a 192k -movflags +faststart out/final.mp4
ls -la out
