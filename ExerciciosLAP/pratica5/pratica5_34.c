#include <stdio.h>
#include <math.h>
#include <stdlib.h>

typedef enum { LINE, CIRCLE, RECTANGLE, TRIANGLE } ShapeKind ;
typedef struct { double x, y; } Point;
typedef struct { Point p1, p2; } Line;
typedef struct { Point centre; double radius; } Circle;
typedef struct { Point top_left; double width, height; } Rectangle;
typedef struct { Point p1, p2, p3;} Triangle;

typedef struct {   // Isto é um tipo SOMA, programado com a ajuda duma UNION
  ShapeKind kind;
  int color;
  union {
    Line line; 
    Circle circle;
    Triangle triangle;
    Rectangle rectangle; 
  } u;
} Shape;

Point point(double x, double y) // construtor de pontos
{
    Point p = {x, y};
    return p;
}

Shape line(Point p1, Point p2, int color) // construtor de linhas
{
    Line l = {p1, p2};
    Shape s = {LINE, color};
    s.u.line = l;
    return s;
}

Shape triangle (Point p1, Point p2,Point p3, int color) // construtor de linhas
{
  Triangle tri = {p1, p2, p3};
  Shape s = {TRIANGLE, color};
  s.u.triangle = tri;
  return s;
}

Shape circle(Point centre, double radius, int color){
  Circle circle = {centre, radius};
  Shape s = {CIRCLE, color};
  s.u.circle = circle;
  return s;
}

Shape rectangle(Point top_left, double width, double height, int color){
  Rectangle rec = {top_left, width, height};
  Shape s = {RECTANGLE, color};
  s.u.rectangle = rec;
  return s;
}

double area (Shape s){
  switch(s.kind){
  case LINE:
    return 0;
  case CIRCLE:
    return M_PI * s.u.circle.radius * s.u.circle.radius;
  case RECTANGLE:
    return s.u.rectangle.width * s.u.rectangle.height;
  case TRIANGLE:
    printf("todo"); // fazer área do trianglo
    break;
  }
  return 0;
}
int main(void)
{
    Shape c = circle(point(0,0), 1, 99);
    printf("%f\n", area(c));
    Shape t = triangle(point(0,0), point(5,10), point(10,5), 99);
    printf("%f\n", area(t));
    return 0;
}
