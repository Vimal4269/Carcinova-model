@echo off
echo Installing Backend Requirements...
cd backend
python -m venv venv
call venv\Scripts\activate.bat
pip install -r requirements.txt
cd ..

echo Installing Frontend Requirements...
cd frontend
npm install
cd ..

echo Installing Mobile-Frontend Requirements...
cd mobile-frontend
npm install
cd ..

echo All requirements installed successfully!
pause
