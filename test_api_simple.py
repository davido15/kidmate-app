#!/usr/bin/env python3
import requests
import json

# Test the API endpoints
base_url = "http://localhost:3000"

def test_login():
    """Test login endpoint"""
    url = f"{base_url}/api/login"
    data = {
        "email": "test22@gmail.com",
        "password": "password"
    }
    
    try:
        response = requests.post(url, json=data)
        print(f"Login Response Status: {response.status_code}")
        print(f"Login Response: {response.text}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Login successful!")
            print(f"Access Token: {result.get('access_token', 'Not found')}")
            return result.get('access_token')
        else:
            print(f"❌ Login failed: {response.text}")
            return None
    except Exception as e:
        print(f"❌ Login error: {e}")
        return None

def test_me_endpoint(token):
    """Test /api/me endpoint"""
    url = f"{base_url}/api/me"
    headers = {"Authorization": f"Bearer {token}"}
    
    try:
        response = requests.get(url, headers=headers)
        print(f"\nMe Response Status: {response.status_code}")
        print(f"Me Response: {response.text}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Me endpoint successful!")
            return result
        else:
            print(f"❌ Me endpoint failed: {response.text}")
            return None
    except Exception as e:
        print(f"❌ Me endpoint error: {e}")
        return None

def test_get_children(token):
    """Test /api/get-children endpoint"""
    url = f"{base_url}/api/get-children"
    headers = {"Authorization": f"Bearer {token}"}
    
    try:
        response = requests.get(url, headers=headers)
        print(f"\nGet Children Response Status: {response.status_code}")
        print(f"Get Children Response: {response.text}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Get children successful!")
            return result
        else:
            print(f"❌ Get children failed: {response.text}")
            return None
    except Exception as e:
        print(f"❌ Get children error: {e}")
        return None

if __name__ == "__main__":
    print("🧪 Testing KidMate API endpoints...")
    print("=" * 50)
    
    # Test login
    token = test_login()
    
    if token:
        print("\n" + "=" * 50)
        print("Testing authenticated endpoints...")
        
        # Test /api/me
        me_result = test_me_endpoint(token)
        
        # Test /api/get-children
        children_result = test_get_children(token)
        
        if children_result and children_result.get('success'):
            print(f"\n✅ All tests passed! Found {len(children_result.get('children', []))} children")
        else:
            print("\n❌ Some tests failed")
    else:
        print("\n❌ Cannot test authenticated endpoints without token") 