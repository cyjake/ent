#!/usr/bin/env ruby
# encoding: utf-8
require 'rubygems'
require 'sinatra'

TITLE_MAP = {
  basic: '基本功能',
  tbcc: '创意中心兼容性',
  seajs: '与 seajs 兼容性'
}

set :public_folder, File.dirname(__FILE__) + '/static'

def test_cases
  root = File.dirname(__FILE__)
  Dir.glob(File.join(root, 'static/test', '*.js')).map do |file|
    file =~ /\.js$/ ? file.sub(/\.js$/, '').sub(/^.+\//, '') : nil
  end.compact
end

get '/' do
  @cases = test_cases

  erb :index
end

get '/test/:name' do
  @name = params[:name]
  @title = TITLE_MAP[@name.to_sym]

  erb :test
end