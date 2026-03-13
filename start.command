#!/bin/bash
cd "$(dirname "$0")"
echo "YasFlix ローカルサーバーを起動しています..."
echo "起動後、ブラウザで http://localhost:8080 を開いてください。"
python3 -m http.server 8080
