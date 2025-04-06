"use client"
import { useEffect, useRef } from 'react'
import * as THREE from 'three'

const ImpossibleBox = () => {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return

    let scene: THREE.Scene
    let camera: THREE.PerspectiveCamera
    let renderer: THREE.WebGLRenderer
    let impossibleBox: THREE.Group
    let autoRotationSpeed = 0.005
    let currentRotationX = 0
    let currentRotationY = 0
    let targetRotationX = 0
    let targetRotationY = 0
    let isDragging = false

    // Initialize Three.js
    const initThree = () => {
      scene = new THREE.Scene()
      scene.background = new THREE.Color(0x000000)
      
      camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
      camera.position.z = 5
      
      renderer = new THREE.WebGLRenderer({ antialias: true })
      renderer.setSize(window.innerWidth, window.innerHeight)
      renderer.setPixelRatio(window.devicePixelRatio)
      
      if (containerRef.current) {
        containerRef.current.innerHTML = ''
        containerRef.current.appendChild(renderer.domElement)
      }

      createImpossibleBox()
      
      window.addEventListener('resize', onWindowResize)
      window.addEventListener('mousedown', () => isDragging = true)
      window.addEventListener('mouseup', () => isDragging = false)
      window.addEventListener('mousemove', onMouseMove)
    }

    // Create the impossible box
    const createImpossibleBox = () => {
      impossibleBox = new THREE.Group()
      
      const edgeMaterial = new THREE.MeshBasicMaterial({ 
        color: 0x00ffff,
        transparent: true,
        opacity: 0.8
      })
      
      // Create edges with glow effect
      const edges = [
        // Front face
        [-1, -1, 1, 2, 0.1, 0.1],
        [-1, 1, 1, 2, 0.1, 0.1],
        [-1, -1, 1, 0.1, 2, 0.1],
        [1, -1, 1, 0.1, 2, 0.1],
        
        // Back face
        [-1, -1, -1, 2, 0.1, 0.1],
        [-1, 1, -1, 2, 0.1, 0.1],
        [-1, -1, -1, 0.1, 2, 0.1],
        [1, -1, -1, 0.1, 2, 0.1],
        
        // Connecting edges
        [-1, -1, 1, 0.1, 0.1, -2],
        [1, -1, 1, 0.1, 0.1, -2],
        [-1, 1, 1, 0.1, 0.1, -2],
        [1, 1, 1, 0.1, 0.1, -2],
        
        // Impossible edges
        [-1, -1, -0.5, 0.1, 0.1, 1.5],
        [1, -1, -0.5, 0.1, 0.1, 1.5],
      ]

      edges.forEach(([x, y, z, w, h, d]) => {
        const geometry = new THREE.BoxGeometry(w, h, d)
        const edge = new THREE.Mesh(geometry, edgeMaterial)
        edge.position.set(x, y, z)
        impossibleBox.add(edge)
      })
      
      scene.add(impossibleBox)
    }

    // Handle window resize
    const onWindowResize = () => {
      if (camera && renderer) {
        camera.aspect = window.innerWidth / window.innerHeight
        camera.updateProjectionMatrix()
        renderer.setSize(window.innerWidth, window.innerHeight)
      }
    }

    // Handle mouse movement
    const onMouseMove = (event: MouseEvent) => {
      if (!isDragging) return
      
      const movementX = event.movementX || 0
      const movementY = event.movementY || 0
      
      targetRotationY += movementX * 0.005
      targetRotationX += movementY * 0.005
    }

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate)
      
      if (!isDragging) {
        targetRotationY += autoRotationSpeed
      }
      
      // Smooth rotation
      currentRotationX += (targetRotationX - currentRotationX) * 0.1
      currentRotationY += (targetRotationY - currentRotationY) * 0.1
      
      if (impossibleBox) {
        impossibleBox.rotation.x = currentRotationX
        impossibleBox.rotation.y = currentRotationY
      }
      
      renderer.render(scene, camera)
    }

    // Start everything
    initThree()
    animate()

    // Cleanup function
    return () => {
      window.removeEventListener('resize', onWindowResize)
      window.removeEventListener('mousedown', () => isDragging = true)
      window.removeEventListener('mouseup', () => isDragging = false)
      window.removeEventListener('mousemove', onMouseMove)
      
      if (renderer) {
        renderer.dispose()
      }
      if (containerRef.current) {
        containerRef.current.innerHTML = ''
      }
    }
  }, [])

  return (
    <div ref={containerRef} className="w-full h-full" />
  )
}

export default ImpossibleBox 