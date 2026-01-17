# Day 05: Shadows - Learning Guide

## What are Shadows in Three.js?

Shadows in Three.js simulate how light is blocked by objects, creating darker areas on surfaces behind them. They add depth and realism to 3D scenes.

## Core Concepts

### 1. Shadow Maps
Three.js uses **shadow mapping** - the scene is rendered from the light's perspective to determine what's in shadow.

### 2. Three Key Players
For shadows to work, you need:
- A **renderer** that supports shadows
- **Light(s)** that can cast shadows
- **Objects** that either cast OR receive shadows (or both)

---

## The Renderer

Your renderer needs shadows enabled:

```javascript
renderer.shadowMap.enabled = ____;  // Boolean value
```

**Shadow Types** (optional, improves quality):
- `THREE.BasicShadowMap` - Fast but blocky
- `THREE.PCFShadowMap` - Default, smoother
- `THREE.PCFSoftShadowMap` - Softest, best quality
- `THREE.VSMShadowMap` - Very soft, can have artifacts

```javascript
renderer.shadowMap.type = THREE.________;
```

---

## Lights That Cast Shadows

Not all lights can cast shadows! Only these can:
- ✅ `DirectionalLight` (like the sun)
- ✅ `SpotLight` (like a flashlight)
- ✅ `PointLight` (like a light bulb)
- ❌ `AmbientLight` - NO shadows
- ❌ `HemisphereLight` - NO shadows

To make a light cast shadows:
```javascript
light.castShadow = ____;  // Boolean
```

### Shadow Camera Configuration (Important!)

Each shadow-casting light has an invisible camera that "sees" the shadow map. You need to configure it:

**For DirectionalLight:**
```javascript
light.shadow.mapSize.width = _____;   // Higher = better quality (powers of 2)
light.shadow.mapSize.height = _____;

light.shadow.camera.near = ____;  // How close shadows start
light.shadow.camera.far = ____;   // How far shadows go
light.shadow.camera.left = ____;  // Orthographic bounds
light.shadow.camera.right = ____;
light.shadow.camera.top = ____;
light.shadow.camera.bottom = ____;
```

**Common values:**
- mapSize: 1024, 2048, 4096 (higher = better but slower)
- near: 0.5
- far: 50-100
- left/right/top/bottom: adjust based on your scene size

---

## Objects

### Objects That Cast Shadows
Objects that block light need:
```javascript
mesh.castShadow = ____;  // Boolean
```

### Objects That Receive Shadows
Surfaces where shadows appear need:
```javascript
mesh.receiveShadow = ____;  // Boolean
```

### Important Notes:
- An object can do **both** (cast AND receive)
- Your ground/floor should almost always **receive shadows**
- Most 3D objects should **cast shadows**

---

## Common Issues & Tips

### ❌ "I don't see any shadows!"
Check:
1. Is `renderer.shadowMap.enabled = true`?
2. Does your light have `castShadow = true`?
3. Do your objects have `castShadow = true`?
4. Does your ground have `receiveShadow = true`?
5. Is your light actually pointing at the scene?

### ❌ "Shadows are blocky/pixelated"
- Increase `light.shadow.mapSize` (try 2048 or 4096)
- Use a softer shadow map type: `THREE.PCFSoftShadowMap`

### ❌ "Shadows are cut off"
- Adjust the shadow camera bounds (left, right, top, bottom)
- Increase `shadow.camera.far`

### 💡 Debugging Tip
Add a helper to visualize the shadow camera:
```javascript
const helper = new THREE.CameraHelper(light.shadow.camera);
scene.add(helper);
```

---

## Your Challenge

Create a scene with:
- Multiple 3D objects (cube, sphere, cone, etc.)
- A ground plane to receive shadows
- At least one light that casts shadows
- Proper shadow configuration for quality
- Optional: Animate something so you can see the shadow move!

Remember: Shadows cost performance, so use them wisely in real projects!
