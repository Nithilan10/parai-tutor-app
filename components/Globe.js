'use client'
import { useEffect, useRef } from 'react'
import * as THREE from 'three'

export default function Globe() {
  const mountRef = useRef(null)

  useEffect(() => {
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000)
    const renderer = new THREE.WebGLRenderer({ alpha: true })
    renderer.setSize(500, 500)
    mountRef.current.appendChild(renderer.domElement)

    const geometry = new THREE.SphereGeometry(2, 32, 32)
    const material = new THREE.MeshPhongMaterial({
      color: 0x4299e1,
      wireframe: true,
    })
    const sphere = new THREE.Mesh(geometry, material)
    scene.add(sphere)

    const light = new THREE.DirectionalLight(0xffffff, 1)
    light.position.set(5, 3, 5)
    scene.add(light)

    camera.position.z = 5

    const animate = () => {
      requestAnimationFrame(animate)
      sphere.rotation.y += 0.005
      renderer.render(scene, camera)
    }
    animate()

    return () => {
      mountRef.current?.removeChild(renderer.domElement)
    }
  }, [])

  return <div ref={mountRef} />
}