.PHONY: backend frontend install dev

backend:
	cd backend && source venv/bin/activate && uvicorn main:app --host 0.0.0.0 --port 8000 --reload

frontend:
	cd frontend && npm run dev -- --host

install:
	cd backend && python3 -m venv venv && source venv/bin/activate && pip install -r requirements.txt && cd ../frontend && npm install

dev:
	@echo ""
	@echo "Run in separate terminals:"
	@echo "  Terminal 1: make backend"
	@echo "  Terminal 2: make frontend"
	@echo ""
	@echo "Student submit: http://localhost:5173"
	@echo "Admin portal:   http://localhost:5173/admin/login"
	@echo ""
