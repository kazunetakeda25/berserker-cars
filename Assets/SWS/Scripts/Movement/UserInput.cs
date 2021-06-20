/*  This file is part of the "Simple Waypoint System" project by Rebound Games.
 *  You are only allowed to use these resources if you've bought them directly or indirectly
 *  from Rebound Games. You shall not license, sublicense, sell, resell, transfer, assign,
 *  distribute or otherwise make available to any third party the Service or the Content. 
 */

using UnityEngine;
using System.Collections;

//object controlled by user input
public class UserInput : MonoBehaviour
{
    public PathManager pathContainer;   //which path to call
    public float speed = 10f;    //speed value
    public float sizeToAdd = 1f;     //custom object size which gets added to y position

    //do not change these variables via the inspector (unless you want to)
    private Transform[] waypoints;	//waypoint array of path container
    public int currentPoint = 0;	//current waypoint index
    private Transform[] currentPath = new Transform[2];	//current path (always between 2 waypoints)
    public float progress = 0f;	   //object progress between those two waypoints
    private float avgSpeed;    //adjusted speed variable based on path distance


    //called on game launch
    void Start()
    {
        //get defined waypoint array of PathManager 
        waypoints = pathContainer.waypoints;
        //store the current and next waypoint position to initialize the path between those two points
        currentPath[0] = waypoints[currentPoint];
        currentPath[1] = waypoints[currentPoint + 1];

        //get adjusted speed based on variable speed and path length,
        //so the speed stays the same at different waypoint distances
        avgSpeed = speed / Vector3.Distance(currentPath[0].position, currentPath[1].position) * 100; 
    }


    //called every frame
    void Update()
    {
        //right arrow
        if (Input.GetKey("right"))
        {
            //add a value based on time and speed to the progress (we start moving right)
            progress += Time.deltaTime * avgSpeed;
        }
        //left arrow
        if (Input.GetKey("left"))
        {
            //substract value based on time and speed from progress (we start moving left)
            progress -= Time.deltaTime * avgSpeed;
        }


        if (progress < 0 && currentPoint > 0)
        {
            //assuming we move from left to the right,
            //this part gets executed when we reached the left waypoint
            //and there is still a waypoint left on that side (we can walk back)

            //get last and current waypoint and set new path
            currentPath[0] = waypoints[currentPoint - 1];
            currentPath[1] = waypoints[currentPoint];
            //reduce waypoint index
            currentPoint--;
            //position our object at 100% => at the right waypoint
            progress = 100;

            //calculate new speed for these 2 new waypoints as stated above
            avgSpeed = speed / Vector3.Distance(currentPath[0].position, currentPath[1].position) * 100;
        }
        else if (progress > 100 && currentPoint < waypoints.Length - 2)
        {
            //assuming we move from left to the right,
            //this part gets executed when we reached the right waypoint
            //and there is still a waypoint left on that side (we can walk forwards)

            //increase waypoint index
            currentPoint++;
            //get current and next waypoint and set new path
            currentPath[0] = waypoints[currentPoint];
            currentPath[1] = waypoints[currentPoint + 1];
            //position our object at 0% => at the left waypoint
            progress = 0;

            //calculate new speed for these 2 new waypoints as stated above
            avgSpeed = speed / Vector3.Distance(currentPath[0].position, currentPath[1].position) * 100;
        }
        else
        {
            //otherwise, if we reached the left or right end of the path,
            //clamp the progress at this value so the object stays at the same position
            if (progress <= 0) progress = 0f;
            if (progress >= 100) progress = 100f;
        }

        //set object's final position
        //pass in the percentage value of our progress
        PointOnPath(progress/100f);

    }

    void PointOnPath(float number)
    {
        //put the character on the current path (between two waypoints) at 'number' percent
        //http://itween.pixelplacement.com/documentation.php#PointOnPath
        //also we add the defined 'sizeToAdd' value to the y position so it "stands" on the path 
        transform.position = iTween.PointOnPath(currentPath, number) + new Vector3(0, sizeToAdd, 0);
    }
}
