Shader "Car Paint Reflective Specular" 
	{
	Properties 
		{
		_Color ("Main Color (RGB)", Color) = (1,1,1,1)	
		_SpecColor ("Specular Color", Color) = (0.5, 0.5, 0.5, 1)
		_Shininess ("Shininess", Range (0.03, 1)) = 0.078125
		_ReflectColor ("Reflection Color (RGB) RefStrength (A)", Color) = (1,1,1,0.5)
		
		_MainTex ("Base (RGB) Gloss (A)", 2D) = "white" {}
		_SpecMask ("Gloss Mask (A)", 2D) = "white" {}
		_ReflMask ("Reflection Mask (A)", 2D) = "white" {}
		_Cube ("Reflection Cubemap", Cube) = "_Skybox" { TexGen CubeReflect }
		}
		
	SubShader 
		{
		Tags { "RenderType"="Opaque" }
		LOD 200
		
		CGPROGRAM
		#pragma surface surf BlinnPhong		

		sampler2D _MainTex;
		sampler2D _ReflMask;
		sampler2D _SpecMask;
		samplerCUBE _Cube;

		float4 _Color;
		float4 _ReflectColor;
		float _Shininess;
		
		struct Input 
			{
			float2 uv_MainTex;
			float3 worldRefl;
			float3 viewDir;
			};

		void surf (Input IN, inout SurfaceOutput o) 
			{
			half4 tex = tex2D(_MainTex, IN.uv_MainTex);
			half4 spec = tex2D(_SpecMask, IN.uv_MainTex);
			half4 c = tex * _Color;
			o.Albedo = c.rgb;
			
			o.Gloss = tex.a * spec.a;
			o.Specular = _Shininess;
			
			half4 reflcol = texCUBE(_Cube, IN.worldRefl);
			half  reflmask = tex2D(_ReflMask, IN.uv_MainTex).a;
			half fresnel = 1.0-dot(normalize(IN.viewDir), o.Normal);			
			reflcol *= _ReflectColor.a * reflmask * fresnel;
			
			o.Emission = reflcol.rgb * _ReflectColor.rgb;
			o.Alpha = _Color.a;
			}
			
		ENDCG
		} 
	FallBack "Diffuse"
	}
/*
Shader "Car Paint Reflective" 
	{
	Properties 
		{
		_Color ("Main Color (RGB) Gloss (A)", Color) = (1,1,1,1)	
		_ReflectColor ("Reflection Color (RGB) RefStrength (A)", Color) = (1,1,1,0.5)
		_SpecColor ("Specular Color", Color) = (0.5, 0.5, 0.5, 1)
		
		_Shininess ("Shininess", Range (0.03, 1)) = 0.078125
		
		_MainTex ("Base (RGB) Gloss (A)", 2D) = "white" {}
		_BumpMap ("Normalmap", 2D) = "bump" {}
		_ReflMask ("Reflection Mask (A)", 2D) = "white" {}
		_Cube ("Reflection Cubemap", Cube) = "_Skybox" { TexGen CubeReflect }
		}
		
	SubShader 
		{
		Tags { "RenderType"="Opaque" }
		LOD 200
		
		CGPROGRAM
		#pragma surface surf BlinnPhong

		float4 _Color;
		float4 _ReflectColor;
		float _Shininess;
		
		sampler2D _MainTex;
		sampler2D _BumpMap;
		sampler2D _ReflMask;
		samplerCUBE _Cube;

		struct Input 
			{
			float2 uv_MainTex;
			float3 worldRefl;
			float3 viewDir;
			};

		void surf (Input IN, inout SurfaceOutput o) 
			{
			half4 c = tex2D(_MainTex, IN.uv_MainTex) * _Color;			
			o.Albedo = c.rgb;
			o.Alpha = c.a;			
			o.Gloss = c.a;
			o.Specular = _Shininess;
			
			o.Normal = UnpackNormal(tex2D(_BumpMap, IN.uv_MainTex));
			
			half fresnel = 1.0-dot(normalize(IN.viewDir), o.Normal);
			
			half4 reflcol = texCUBE(_Cube, IN.worldRefl);
			reflcol *= tex2D(_ReflMask, IN.uv_MainTex).a;
			reflcol *= _ReflectColor.a * fresnel;
			
			o.Emission = reflcol.rgb * _ReflectColor.rgb;
			}
			
		ENDCG
		} 
	FallBack "Diffuse"
	}
*/